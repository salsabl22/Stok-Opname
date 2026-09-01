import { Router } from 'express';
import { getProduk, createProduk, updateProduk, deleteProduk } from '../controllers/produkController';

const router = Router();
router.get('/', getProduk);
router.post('/', createProduk);
router.put('/:id', updateProduk);
router.delete('/:id', deleteProduk);

export default router;
