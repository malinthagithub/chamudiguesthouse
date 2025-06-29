class LoyaltyService {
  static calculateDiscount(currentPoints, totalAmount) {
    let discount = 0;
    let usedPoints = false;

    if (currentPoints >= 100) {
      discount = totalAmount * 0.2;
      usedPoints = true;
    }

    return { discount, usedPoints };
  }

  static calculateNewPoints(currentPoints, usedPoints) {
    return usedPoints ? 10 : Math.min(currentPoints + 10, 100);
  }
}

module.exports = LoyaltyService;