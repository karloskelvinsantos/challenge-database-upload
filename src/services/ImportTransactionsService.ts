import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  transactionsFilename: string,
}

interface TransactionDTO {
  id: string,
  title: string,
  value: number,
  type: string,
  category: string
}

async function loadCSV(filePath: string): Promise<any[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    fromLine: 2,
    ltrim: true,
    rtrim: true
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: any[] = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}


class ImportTransactionsService {
  async execute({ transactionsFilename }: RequestDTO): Promise<TransactionDTO[]> {
    const csvFilePath = path.join(uploadConfig.directoryImages, transactionsFilename);

    const dataCSV = await loadCSV(csvFilePath);

    const transactions: TransactionDTO[] = [];
    const createTransactionService = new CreateTransactionService();
    
    dataCSV.map(async item => {
      const transaction = await createTransactionService.execute({
        title: item[0],
        type: item[1],
        value: item[2],
        category: item[3]
      });

      transactions.push(transaction);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
