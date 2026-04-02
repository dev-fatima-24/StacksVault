;; yield.clar
;; Global yield index management and per-user yield tracking

(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u102))

;; Global yield index (scaled by 1e8 for precision)
(define-data-var global-yield-index uint u100000000) ;; starts at 1.0 (1e8)
(define-data-var last-update-block uint u0)
;; ~5% APY: per-block increment = 5e8 / 52560 ≈ 9512 (scaled)
(define-data-var yield-per-block uint u9512)

;; User's yield index snapshot at deposit time
(define-map user-yield-index principal uint)

;; Update global yield index based on blocks elapsed
(define-public (update-yield-index)
  (let (
    (last-block (var-get last-update-block))
    (blocks (if (> block-height last-block) (- block-height last-block) u0))
    (increment (* blocks (var-get yield-per-block)))
    (new-index (+ (var-get global-yield-index) increment))
  )
    (var-set global-yield-index new-index)
    (var-set last-update-block block-height)
    (ok new-index)))

;; Snapshot user's current index (call on deposit)
(define-public (snapshot-user-index (user principal))
  (begin
    (map-set user-yield-index user (var-get global-yield-index))
    (ok true)))

;; Read-only: get current global index
(define-read-only (get-global-index)
  (var-get global-yield-index))

;; Read-only: get user's index snapshot
(define-read-only (get-user-index (user principal))
  (default-to (var-get global-yield-index) (map-get? user-yield-index user)))

;; Read-only: compute yield multiplier for user (scaled 1e8)
;; yield = principal * (global_index - user_index) / user_index
(define-read-only (get-yield-multiplier (user principal))
  (let (
    (global (var-get global-yield-index))
    (user-idx (get-user-index user))
  )
    (if (> global user-idx)
      (/ (* (- global user-idx) u100000000) user-idx)
      u0)))

;; Admin: set yield per block
(define-public (set-yield-per-block (rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set yield-per-block rate)
    (ok true)))
