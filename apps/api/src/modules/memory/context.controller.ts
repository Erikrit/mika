import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import {
  CreateContextDocumentSchema,
  UpdateContextDocumentSchema,
} from '@mika/shared';
import { ContextDocumentService } from './context-document.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

class CreateContextDocumentDto extends createZodDto(CreateContextDocumentSchema) {}
class UpdateContextDocumentDto extends createZodDto(UpdateContextDocumentSchema) {}

class ReimportBodyDto extends createZodDto(
  CreateContextDocumentSchema.pick({ content: true }),
) {}

@Controller('context/documents')
@ApiTags('context')
@ApiBearerAuth()
export class ContextController {
  constructor(private readonly service: ContextDocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Listar documentos de contexto' })
  list(
    @CurrentUser() user: AuthUser,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.service.list(user.id, includeArchived === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter documento de contexto' })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user.id, id);
  }

  @Get(':id/versions/:versionId')
  @ApiOperation({ summary: 'Obter conteúdo de uma versão do documento' })
  version(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.service.getVersion(user.id, id, versionId);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Histórico de versões do documento' })
  versions(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('preview') preview?: string,
  ) {
    return this.service.getVersions(user.id, id, preview === 'true');
  }

  @Post()
  @ApiOperation({ summary: 'Criar documento de contexto' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContextDocumentDto) {
    return this.service.create(user.id, dto);
  }

  @Post(':id/reimport')
  @ApiOperation({ summary: 'Reimportar conteúdo (nova versão)' })
  reimport(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReimportBodyDto,
  ) {
    return this.service.reimport(user.id, id, dto.content);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar metadados do documento' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateContextDocumentDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir documento e chunks associados' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}
