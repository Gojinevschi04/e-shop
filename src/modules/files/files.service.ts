import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { FileDto } from './file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private localFilesRepository: Repository<File>,
  ) {}

  async findAll(): Promise<File[]> {
    return this.localFilesRepository.find();
  }

  async create(fileDto: FileDto): Promise<File> {
    return this.localFilesRepository.save(fileDto);
  }

  async saveFileData(fileData: FileDto) {
    const newFile = this.localFilesRepository.create(fileData);
    await this.localFilesRepository.save(newFile);
    return newFile;
  }

  async update(id: number, updateFileDto: FileDto): Promise<File> {
    const oldFileData = await this.localFilesRepository.findOneBy({
      id: id,
    });

    if (oldFileData == null) {
      throw new BadRequestException('Nonexistent file to update');
    }

    const fileData = this.localFilesRepository.merge(
      oldFileData,
      updateFileDto,
    );

    return this.localFilesRepository.save(fileData);
  }

  findUploadedFile(image: string, res: any): Promise<any> {
    return res.sendFile(image, { root: './storage' });
  }

  async findOneById(id: number): Promise<File | null> {
    const file = await this.localFilesRepository.findOneBy({ id: id });

    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async delete(id: number): Promise<void> {
    await this.localFilesRepository.delete(id);
  }
}
