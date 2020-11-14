import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';

import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';

interface RequestDTO {
  file: string,
}

class ImportTransactionsService {
  
  async execute({ file }: RequestDTO): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directoryImages, file);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      fromLine: 2,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: any[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactionsCreated: Transaction[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const existentCategory = await getRepository(Category).findOne({ where: { title: transactions[i].category } });

      if (existentCategory) {
        const trans = getRepository(Transaction).create({
          title: transactions[i].title,
          type: transactions[i].type,
          value: transactions[i].value,
          category: existentCategory
        });

        transactionsCreated.push(trans);
        continue;
      }
      
      const categoryCreated = getRepository(Category).create({
        title: transactions[i].category
      });

      await getRepository(Category).save(categoryCreated);

      const trans = getRepository(Transaction).create({
        title: transactions[i].title,
        type: transactions[i].type,
        value: transactions[i].value,
        category: categoryCreated
      });

      transactionsCreated.push(trans);
    }

    await getRepository(Transaction).save(transactionsCreated);
    
    return transactionsCreated;
  }

}

export default ImportTransactionsService;
