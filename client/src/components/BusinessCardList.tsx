
import { BusinessCardDisplay } from './BusinessCardDisplay';
import type { BusinessCard } from '../../../server/src/schema';

interface BusinessCardListProps {
  cards: BusinessCard[];
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export function BusinessCardList({ cards, onDelete, showActions = false }: BusinessCardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No business cards yet</h3>
        <p className="text-gray-500">Create your first digital business card to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card: BusinessCard) => (
        <BusinessCardDisplay
          key={card.id}
          card={card}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
