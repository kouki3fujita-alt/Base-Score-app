use dep::std;

fn main(
    // Private Inputs
    eth_balance: Field,
    holding_days: Field,
    tx_count: Field,
    active_days: Field,
    dex_volume: Field,
    lending_used: bool,
    lp_amount: Field,
    liquidation_count: Field,
    staking_amount: Field,
    
    // Public Outputs
    threshold: pub Field
) -> pub Field {
    
    // Weighted Score Calculation
    // Using integer arithmetic, scaling might be needed for decimals but we use rough integers here.
    
    // 1. ETH Balance (20%): 1 point per 0.01 ETH (approx), max 200
    // Simplified: Just use raw field values as points for MVP
    let eth_score = eth_balance * 20; 

    // 2. Holding Days (15%): 1 point per day
    let holding_score = holding_days * 2; 

    // 3. Tx Count (10%)
    let tx_score = tx_count * 5;

    // 4. Active Days (10%)
    let active_score = active_days * 2;

    // 5. DEX Volume (20%)
    let dex_score = dex_volume / 10; 

    // 6. Lending Used (15%)
    let lending_score = if lending_used { 150 } else { 0 };

    // 7. LP Amount (5%)
    let lp_score = lp_amount / 10;

    // 8. Staking (5%)
    let staking_score = staking_amount / 10;

    // 9. Penalty
    let penalty = liquidation_count * 200;

    let total_score_raw = eth_score + holding_score + tx_score + active_score + dex_score + (lending_score as Field) + lp_score + staking_score;
    
    let total_score = if total_score_raw as u64 > penalty as u64 {
        total_score_raw - penalty
    } else {
        0
    };

    // Cap at 1000
    let final_score = if total_score as u64 > 1000 {
        1000
    } else {
        total_score
    };

    // Verification
    assert(final_score as u64 >= threshold as u64);
    
    final_score
}

#[test]
fn test_main() {
    let score = main(10, 30, 20, 60, 1000, true, 100, 0, 100, 500);
    // Rough calc: 200 + 60 + 100 + 120 + 100 + 150 + 10 + 10 - 0 = 750
    assert(score == 750);
}
