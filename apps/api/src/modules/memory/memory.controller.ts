import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MemoryService } from './memory.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

const MemorySearchSchema = z.object({
  query: z.string().min(1),
  lifeAreaId: z.string().uuid().optional(),
});

class MemorySearchDto extends createZodDto(MemorySearchSchema) {}

@Controller('memory')
@ApiTags('memory')
@ApiBearerAuth()
export class MemoryController {
  constructor(private readonly service: MemoryService) {}

  @Get('chunks')
  @ApiOperation({ summary: 'Listar chunks de memória' })
  listChunks(
    @CurrentUser() user: AuthUser,
    @Query('lifeAreaId') lifeAreaId?: string,
  ) {
    return this.service.listChunks(user.id, lifeAreaId);
  }

  @Post('search')
  @ApiOperation({ summary: 'Busca híbrida na memória (debug)' })
  search(@CurrentUser() user: AuthUser, @Body() dto: MemorySearchDto) {
    return this.service.search(user.id, dto.query, dto.lifeAreaId);
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar nota Markdown' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importMarkdown(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('lifeAreaId') lifeAreaId?: string,
  ) {
    const content = file.buffer.toString('utf-8');
    return this.service.importMarkdown(
      user.id,
      file.originalname,
      content,
      lifeAreaId,
    );
  }
}
