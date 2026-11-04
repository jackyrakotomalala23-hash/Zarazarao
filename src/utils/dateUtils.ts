export function formatPublicationDuration(createdAt: string | Date | undefined): string {
  if (!createdAt) return 'Publié récemment';
  
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMs = now.getTime() - created.getTime();
  
  if (isNaN(diffInMs) || diffInMs < 0) return 'Publié récemment';
  
  const diffInSec = Math.floor(diffInMs / 1000);
  if (diffInSec < 60) return "Publié à l'instant";
  
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `Publié il y a ${diffInMin} min`;
  
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `Publié il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `Publié il y a ${diffInDays}j`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `Publié il y a ${diffInMonths} mois`;
  
  return `Publié le ${created.toLocaleDateString('fr-FR')}`;
}
