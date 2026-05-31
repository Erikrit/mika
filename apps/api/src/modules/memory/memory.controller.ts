import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UpdateMemoryChunkSchema } from '@mika/shared';
import { MemoryService } from './memory.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

const MemorySearchSchema = z.object({
  query: z.string().min(1),
  lifeAreaId: z.string().uuid().optional(),
});

class MemorySearchDto extends createZodDto(MemorySearchSchema) {}
class UpdateMemoryChunkDto extends createZodDto(UpdateMemoryChunkSchema) {}

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

  @Patch('chunks/:id')
  @ApiOperation({ summary: 'Override governança do chunk' })
  updateChunk(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMemoryChunkDto,
  ) {
    return this.service.updateChunk(user.id, id, dto);
  }

  @Delete('chunks/:id')
  @ApiOperation({ summary: 'Remover chunk' })
  deleteChunk(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.deleteChunk(user.id, id);
  }

  @Get('health')
  @ApiOperation({ summary: 'Métricas de saúde da memória' })
  health(@CurrentUser() user: AuthUser) {
    return this.service.getHealth(user.id);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Log de uso de memória sensível' })
  audit(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listAudit(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('search')
  @ApiOperation({ summary: 'Busca híbrida na memória (debug)' })
  search(@CurrentUser() user: AuthUser, @Body() dto: MemorySearchDto) {
    return this.service.search(user.id, dto.query, dto.lifeAreaId);
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar nota Markdown/TXT' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importMarkdown(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('lifeAreaId') lifeAreaId?: string,
    @Body('documentId') documentId?: string,
    @Body('title') title?: string,
    @Body('category') category?: string,
    @Body('memoryType') memoryType?: string,
    @Body('privacyLevel') privacyLevel?: string,
  ) {
    const content = file.buffer.toString('utf-8');
    return this.service.importMarkdown(
      user.id,
      file.originalname,
      content,
      lifeAreaId,
      documentId,
      { title, category, memoryType, privacyLevel },
    );
  }
}
