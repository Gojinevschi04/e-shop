import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('/:imgPath')
  findUploadedFile(
    @Param('imgPath') image: string,
    @Res() res: any,
  ): Promise<any> {
    return this.filesService.findUploadedFile(image, res);
  }
}
