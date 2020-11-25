import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<void> {
    const repository = getRepository(Transaction);

    const result = await repository.delete(id);

    if (!result) {
      throw new AppError('This delete ocurred error!', 400);
    }
  }
}

export default DeleteTransactionService;
