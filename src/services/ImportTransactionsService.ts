import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';

import uploadConfig from '../config/upload';
import Category from '../models/Category';

import Transaction from '../models/Transaction';

interface RequestDTO {
  file: string;
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

    // eslint-disable-next-line no-restricted-syntax
    for (const transaction of transactions) {
      // eslint-disable-next-line no-await-in-loop
      const existentCategory = await getRepository(Category).findOne({
        where: { title: transaction.category },
      });

      if (existentCategory) {
        const newTransaction = getRepository(Transaction).create({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: existentCategory,
        });

        transactionsCreated.push(newTransaction);
        // eslint-disable-next-line no-continue
        continue;
      }

      const categoryCreated = getRepository(Category).create({
        title: transaction.category,
      });

      // eslint-disable-next-line no-await-in-loop
      await getRepository(Category).save(categoryCreated);

      const newTransaction = getRepository(Transaction).create({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: categoryCreated,
      });

      transactionsCreated.push(newTransaction);
    }

    await getRepository(Transaction).save(transactionsCreated);

    return transactionsCreated;
  }
}

export default ImportTransactionsService;
