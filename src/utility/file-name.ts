import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export const editFileName = (
  req: any,
  file: { originalname: string },
  callback: (arg0: null, arg1: string) => void,
) => {
  const fileExtName = extname(file.originalname);
  const uniqueName = uuidv4(); // Generate a UUID for the file name
  callback(null, `${uniqueName}${fileExtName}`);
};
