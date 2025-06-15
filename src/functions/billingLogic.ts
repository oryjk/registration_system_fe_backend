export interface PenaltyResult {
  amount: number;
  type: 'normal' | 'penalty';
}

export function calculateMonthlyPenalty(competitionsCount: number, participationsCount: number): PenaltyResult {
  // New logic: If at least 4 competitions in a month (status 2 or 3)
  if (competitionsCount >= 4) {
    if (participationsCount === 0) {
      return { amount: 100, type: 'penalty' }; // No participation, penalty 100
    } else if (participationsCount === 1) {
      return { amount: 50, type: 'penalty' }; // Participated in 1, penalty 50
    } else {
      return { amount: 0, type: 'normal' }; // Participated in 2 or more, no penalty
    }
  } else { // If less than 4 competitions in a month
    if (participationsCount === 0) {
      return { amount: 100, type: 'penalty' }; // No participation, penalty 100
    } else {
      return { amount: 0, type: 'normal' }; // Participated in 1 or more, no penalty
    }
  }
}
