import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';
import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  try {
    const transactions = await getRepository(Transaction).find();
    const balance = await getCustomRepository(TransactionsRepository).getBalance();

    return response.json({
      transactions,
      balance
    });
  } catch (error) {
    return response.status(error.statusCode).json({ error: error.message });
  }


});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const service = new CreateTransactionService();

    const transaction = await service.execute({ title, value, type, category });

    return response.json(transaction);
  } catch (error) {
    return response.status(error.statusCode).json({ status: 'error', message: error.message });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const id = request.params.id;

    const service = new DeleteTransactionService();

    await service.execute({ id });

    return response.send();
  } catch (error) {
    return response.status(error.statusCode).json({ error: error.message });
  }


});

transactionsRouter.post('/import', upload.single('transactions'),  async (request, response) => {
  const importTransactions = new ImportTransactionsService();

  const transactions = await importTransactions.execute({ transactionsFilename: request.file.filename });
  
  return response.json(transactions);
});

export default transactionsRouter;
