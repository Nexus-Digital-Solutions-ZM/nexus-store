# nexus-store

Mini online store built as a team task by Nexus Digital Solutions ZM junior developers.

## Overview

A small store with a website, a backend API and stock inventory. Payments are mocked for now, and the payment layer must be built so a real provider (e.g. Lipila) can be plugged in later.

## Scope

**Frontend**
- Product list with dummy products
- Cart: add, remove, change quantity, see total
- Out-of-stock products clearly marked, and they can't be added to the cart
- Checkout with two payment options:
  - Mobile Money (mocked)
  - Visa / Card (mocked)

**Backend**
- API for products, cart/orders and checkout
- Every product has a stock count
- Checkout reduces stock
- The store must never sell more than what is in stock
- Every stock change (sale, restock, correction) is recorded, not only the current count
- Payment logic kept separate from the rest of the code

## Plan first

Before writing code, post your answers to these in the group chat:

1. How will you store products and stock (data shape, and what database or file)?
2. When does stock go down: when an item is added to the cart, or only after payment succeeds?
3. What happens if two people try to buy the last item at the same time?
4. What happens if payment fails after stock has been reserved?
5. How will you track every stock change (sale, restock, correction), not only the current count?

Also agree who does what, the cart data shape (e.g. `{ id, name, price, qty }`) and the stack, with a short reason for your choices.

## Stock and checkout rules

- Stock is reserved for 10 minutes when checkout starts.
- The backend checks for expired reservations and releases the stock before processing new requests.
- If payment succeeds, the reservation becomes a completed sale and stock is reduced.
- If payment fails or expires, the stock is released.
- Each payment has a unique ID. Duplicate confirmations are ignored so stock is not reduced twice.
- Restocks and corrections are recorded as stock movements with the quantity, reason, previous stock, new stock, and date.
- Restock and correction actions are admin-only and protected by a token stored in an environment variable.
- The `.env` file must never be committed.

## Team

| Name | GitHub | Responsibility |
| --- | --- | --- |
| Micheal Chisha | @chishamichael | _to be agreed_ |
| Munashe Mandizvidza | @munashe-mandi | _to be agreed_ |

## Working rules

1. Plan first. Answer the questions above and agree who does what before coding.
2. Work on your own branch (e.g. `feature/cart`, `feature/stock-api`). Don't both work on the same branch.
3. Merge into `main` only when your part works, and tell the other person when you do.
4. Run `git pull origin main` before you start work and before you merge.
5. Commit in small steps with clear messages.
6. Post short progress updates in the group and flag blockers early.
7. Never commit API keys, secrets or `.env` files.

## Git workflow

```bash
git clone https://github.com/Nexus-Digital-Solutions-ZM/nexus-store.git
cd nexus-store
git checkout -b feature/your-task
# make changes
git add .
git commit -m "Clear message"
git push origin feature/your-task
```

To bring your finished work into `main`:

```bash
git checkout main
git pull origin main
git merge feature/your-task
git push origin main
```

## Getting started

_To be added by the team once the stack is chosen: install and run steps for the frontend and the backend._

## Deadline

Tuesday 29 Sept, 6 PM.