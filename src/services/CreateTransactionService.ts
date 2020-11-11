import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string,
  value: number,
  type: 'outcome' | 'income',
  category: string
}

interface TransactionDTO {
  id: string,
  title: string,
  value: number,
  type: string,
  category: string
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: RequestDTO): Promise<TransactionDTO> {
    const repository = getRepository(Transaction);

    if (type === 'outcome') {
      const balance = await getCustomRepository(TransactionsRepository).getBalance();

      if (value > balance.total) {
        throw new AppError('Your balance is not sufficient for this transation!');
      }
    }

    const categoryExisting = await getRepository(Category).findOne({ where: { title: category } });

    if (!categoryExisting) {
      const categoryCreated = getRepository(Category).create({
        title: category
      });

      await getRepository(Category).save(categoryCreated);

      const transaction = repository.create({
        title,
        value,
        type,
        category: categoryCreated
      });

      await repository.save(transaction);

      const transactionDTO: TransactionDTO = {
        id: transaction.id,
        title: transaction.title,
        value: transaction.value,
        category: transaction.category.title,
        type: transaction.type
      }

      return transactionDTO;

    }

    const transaction = repository.create({
      title,
      value,
      type,
      category: categoryExisting
    });

    await repository.save(transaction);

    const transactionDTO: TransactionDTO = {
      id: transaction.id,
      title: transaction.title,
      value: transaction.value,
      category: transaction.category.title,
      type: transaction.type
    }

    return transactionDTO;
  }
}

export default CreateTransactionService;
