;; vault.clar
;; Manages locked balances, deposits, withdrawals, and yield calculation

(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u102))
(define-constant err-no-balance (err u103))
(define-constant err-lock-active (err u104))
(define-constant err-invalid-amount (err u105))

;; Principal balance map: address -> locked STX (in micro-STX)
(define-map vault-balances principal uint)
;; Track deposit block height per user for yield calculation
(define-map deposit-block principal uint)
;; Yield index: basis points per block (simulates ~5% APY on T-bills)
;; 5% APY / 52560 blocks-per-year ≈ 10 basis points per 1000 blocks
(define-data-var yield-rate-bps uint u1) ;; 1 bp per block

;; Deposit locked funds into vault (called by remittance contract)
(define-public (deposit (user principal) (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (let ((current (default-to u0 (map-get? vault-balances user))))
      (map-set vault-balances user (+ current amount))
      (map-set deposit-block user block-height)
      (ok true))))

;; Withdraw principal + accrued yield
(define-public (withdraw (amount uint))
  (let (
    (balance (default-to u0 (map-get? vault-balances tx-sender)))
    (yield-amount (get-accrued-yield tx-sender))
    (total (+ balance yield-amount))
  )
    (asserts! (> balance u0) err-no-balance)
    (asserts! (<= amount total) err-invalid-amount)
    (map-set vault-balances tx-sender (if (>= balance amount) (- balance amount) u0))
    (map-set deposit-block tx-sender block-height)
    (try! (stx-transfer? amount (as-contract tx-sender) tx-sender))
    (ok total)))

;; Read-only: get locked balance
(define-read-only (get-balance (user principal))
  (default-to u0 (map-get? vault-balances user)))

;; Read-only: calculate accrued yield since deposit
(define-read-only (get-accrued-yield (user principal))
  (let (
    (balance (default-to u0 (map-get? vault-balances user)))
    (since (default-to block-height (map-get? deposit-block user)))
    (blocks-elapsed (- block-height since))
    (rate (var-get yield-rate-bps))
  )
    (/ (* balance (* blocks-elapsed rate)) u10000)))

;; Read-only: get total balance including yield
(define-read-only (get-balance-with-yield (user principal))
  (+ (get-balance user) (get-accrued-yield user)))

;; Admin: update yield rate (basis points per block)
(define-public (set-yield-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set yield-rate-bps new-rate)
    (ok true)))
