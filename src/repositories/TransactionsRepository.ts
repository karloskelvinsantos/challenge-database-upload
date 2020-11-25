import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const { income } = await getRepository(Transaction)
      .createQueryBuilder('transactions')
      .select('SUM(transactions.value)', 'income')
      .where("transactions.type = 'income'")
      .getRawOne();

    const { outcome } = await getRepository(Transaction)
      .createQueryBuilder('transactions')
      .select('SUM(transactions.value)', 'outcome')
      .where("transactions.type = 'outcome'")
      .getRawOne();

    const balance = {
      income: income ? Number(income) : 0,
      outcome: Number(outcome),
      total: Number(income - outcome),
    };

    return balance;
  }
}

export default TransactionsRepository;
