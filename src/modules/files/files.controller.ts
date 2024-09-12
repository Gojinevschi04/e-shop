import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { Public } from '../auth/public.decorator';

@Public()
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

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.filesService.deleteFile(id);
  }
}
