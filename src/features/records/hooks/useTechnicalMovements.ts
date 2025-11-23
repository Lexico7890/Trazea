import { useCreateTechnicalMovement } from './useTechnicalMovementsQuery';
import type { TechnicalMovement } from '@/types/technical-movement';

export const useTechnicalMovements = () => {
  const createTechnicalMovementMutation = useCreateTechnicalMovement();

  const handleCreateTechnicalMovement = async (movementData: TechnicalMovement) => {
    try {
      const result = await createTechnicalMovementMutation.mutateAsync(movementData);
      return result;
    } catch (error) {
      // Error is already handled by the mutation's onError callback (toast)
      // We can re-throw if the component needs to know about the error, 
      // but usually the toast is enough for the user.
      console.error("Failed to create technical movement", error);
    }
  };

  return {
    handleCreateTechnicalMovement,
    isProcessing: createTechnicalMovementMutation.isPending,
  };
};
