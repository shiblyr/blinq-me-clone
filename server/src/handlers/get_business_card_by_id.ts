
import { type GetBusinessCardByIdInput, type BusinessCard } from '../schema';

export declare function getBusinessCardById(input: GetBusinessCardByIdInput): Promise<BusinessCard | null>;
