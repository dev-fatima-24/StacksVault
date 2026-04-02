;; remittance.clar
;; Handles sending, receiving, and optional locking of funds

(define-constant err-invalid-percentage (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-amount (err u105))

(define-constant vault-contract .vault)

;; Track remittance history: sender -> count
(define-map remittance-count principal uint)

;; Event-like data map for last remittance per sender
(define-map last-remittance
  principal
  { recipient: principal, amount: uint, locked: uint, instant: uint, block: uint })

;; Send remittance: splits amount into instant transfer + vault lock
;; lock-pct: 0–100 (percentage to lock in vault)
(define-public (send-remittance (recipient principal) (amount uint) (lock-pct uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (<= lock-pct u100) err-invalid-percentage)
    (asserts! (>= (stx-get-balance tx-sender) amount) err-insufficient-balance)

    (let (
      (locked-amount (/ (* amount lock-pct) u100))
      (instant-amount (- amount locked-amount))
    )
      ;; Transfer instant portion to recipient
      (when (> instant-amount u0)
        (try! (stx-transfer? instant-amount tx-sender recipient)))

      ;; Transfer locked portion to vault contract
      (when (> locked-amount u0)
        (try! (stx-transfer? locked-amount tx-sender (as-contract tx-sender)))
        (try! (contract-call? vault-contract deposit recipient locked-amount)))

      ;; Record remittance
      (map-set last-remittance tx-sender
        { recipient: recipient, amount: amount, locked: locked-amount,
          instant: instant-amount, block: block-height })
      (map-set remittance-count tx-sender
        (+ (default-to u0 (map-get? remittance-count tx-sender)) u1))

      (ok { instant: instant-amount, locked: locked-amount }))))

;; Read-only: get last remittance details for a sender
(define-read-only (get-last-remittance (sender principal))
  (map-get? last-remittance sender))

;; Read-only: get remittance count for a sender
(define-read-only (get-remittance-count (sender principal))
  (default-to u0 (map-get? remittance-count sender)))

;; Read-only: calculate split without sending
(define-read-only (calculate-split (amount uint) (lock-pct uint))
  (let ((locked (/ (* amount lock-pct) u100)))
    { instant: (- amount locked), locked: locked }))
