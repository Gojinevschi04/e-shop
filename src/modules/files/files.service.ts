import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { FileDto } from './file.dto';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async findAll(): Promise<File[]> {
    return this.filesRepository.find();
  }

  async create(fileDto: FileDto): Promise<File> {
    return this.filesRepository.save(fileDto);
  }

  async saveFileData(fileData: FileDto) {
    const newFile = this.filesRepository.create(fileData);
    await this.filesRepository.save(newFile);
    return newFile;
  }

  async update(id: number, updateFileDto: FileDto): Promise<File> {
    const oldFileData = await this.filesRepository.findOneBy({
      id: id,
    });

    if (oldFileData == null) {
      throw new BadRequestException('Nonexistent file to update');
    }

    const fileData = this.filesRepository.merge(oldFileData, updateFileDto);

    return this.filesRepository.save(fileData);
  }

  findUploadedFile(image: string, res: any): Promise<any> {
    return res.sendFile(image, { root: './storage' });
  }

  async findOneById(id: number): Promise<File | null> {
    const file = await this.filesRepository.findOneBy({ id: id });

    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    const file = await this.filesRepository.findOneBy({ id: id });

    if (file == null) {
      throw new NotFoundException();
    }
    const fileName = file.path;
    const directoryPath = path.join(__dirname, '..', '..', '..', 'storage/');

    return fs.unlink(directoryPath + fileName, function (error) {
      if (error) {
        console.log(error);
        throw new NotFoundException('Could not delete file');
      }
    });
  }
}
