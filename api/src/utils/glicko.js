/**
 * Glicko-2 Rating System
 *
 * Implements the Glicko-2 algorithm by Mark Glickman.
 * Reference: http://www.glicko.net/glicko/glicko2.pdf
 */

// System constant — constrains volatility change. Typical range 0.3–1.2.
const TAU = 0.5;

// Convergence tolerance for volatility iteration
const EPSILON = 0.000001;

// Scale factor between Glicko-1 and Glicko-2
const SCALE = 173.7178;

/**
 * Convert Glicko-1 rating to Glicko-2 scale.
 */
function toGlicko2(rating, rd) {
  return {
    mu: (rating - 1500) / SCALE,
    phi: rd / SCALE,
  };
}

/**
 * Convert Glicko-2 scale back to Glicko-1.
 */
function fromGlicko2(mu, phi) {
  return {
    rating: mu * SCALE + 1500,
    rd: phi * SCALE,
  };
}

/**
 * The g(phi) function.
 */
function g(phi) {
  return 1 / Math.sqrt(1 + 3 * phi * phi / (Math.PI * Math.PI));
}

/**
 * The E(mu, mu_j, phi_j) expected score function.
 */
function E(mu, muJ, phiJ) {
  return 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));
}

/**
 * Compute new volatility (sigma') using the Illinois algorithm
 * to solve the Glicko-2 equation (Step 5 of the paper).
 */
function computeVolatility(sigma, phi, v, delta) {
  const a = Math.log(sigma * sigma);
  const deltaSq = delta * delta;
  const phiSq = phi * phi;

  function f(x) {
    const ex = Math.exp(x);
    const d = phiSq + v + ex;
    const p1 = (ex * (deltaSq - phiSq - v - ex)) / (2 * d * d);
    const p2 = (x - a) / (TAU * TAU);
    return p1 - p2;
  }

  // Step 5a: Set initial bracket values
  let A = a;
  let B;

  if (deltaSq > phiSq + v) {
    B = Math.log(deltaSq - phiSq - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) {
      k++;
    }
    B = a - k * TAU;
  }

  // Step 5b: Iterative refinement (Illinois algorithm variant)
  let fA = f(A);
  let fB = f(B);

  while (Math.abs(B - A) > EPSILON) {
    const C = A + (A - B) * fA / (fB - fA);
    const fC = f(C);

    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA = fA / 2;
    }
    B = C;
    fB = fC;
  }

  return Math.exp(A / 2);
}

/**
 * Calculate updated ratings for both players after a battle result.
 *
 * @param {object} playerA - { rating, rd, volatility? }
 * @param {object} playerB - { rating, rd, volatility? }
 * @param {number} scoreA - 1 for A wins, 0 for B wins, 0.5 for draw
 * @returns {{ a: {rating, rd, volatility}, b: {rating, rd, volatility} }}
 */
function calculateRatings(playerA, playerB, scoreA) {
  const sigmaA = playerA.volatility || 0.06;
  const sigmaB = playerB.volatility || 0.06;
  const scoreB = 1 - scoreA;

  function update(player, opponent, score, sigma) {
    const p = toGlicko2(player.rating, player.rd);
    const o = toGlicko2(opponent.rating, opponent.rd);

    // Step 3: Compute estimated variance v
    const gPhiJ = g(o.phi);
    const eVal = E(p.mu, o.mu, o.phi);
    const v = 1 / (gPhiJ * gPhiJ * eVal * (1 - eVal));

    // Step 4: Compute delta
    const delta = v * gPhiJ * (score - eVal);

    // Step 5: Compute new volatility
    const sigmaPrime = computeVolatility(sigma, p.phi, v, delta);

    // Step 6: Update phi to pre-rating phi*
    const phiStar = Math.sqrt(p.phi * p.phi + sigmaPrime * sigmaPrime);

    // Step 7: Update rating and RD
    const phiPrime = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
    const muPrime = p.mu + phiPrime * phiPrime * gPhiJ * (score - eVal);

    const result = fromGlicko2(muPrime, phiPrime);
    return {
      rating: Math.round(result.rating * 10) / 10,
      rd: Math.round(result.rd * 10) / 10,
      volatility: sigmaPrime,
    };
  }

  return {
    a: update(playerA, playerB, scoreA, sigmaA),
    b: update(playerB, playerA, scoreB, sigmaB),
  };
}

/**
 * Determine tier from rating.
 */
function getTier(rating) {
  if (rating >= 2000) return 'Diamond';
  if (rating >= 1800) return 'Platinum';
  if (rating >= 1600) return 'Gold';
  if (rating >= 1400) return 'Silver';
  return 'Bronze';
}

module.exports = { calculateRatings, getTier };
