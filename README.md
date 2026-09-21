# nexus-store

Mini online store built as a team task by Nexus Digital Solutions ZM junior developers.

## Overview

A small store website with a product list, a shopping cart and a checkout. Payments are mocked for now, and the payment layer must be built so a real provider (e.g. Lipila) can be plugged in later.

## Scope

- Product list with dummy products
- Cart: add, remove, change quantity, see total
- Checkout with two payment options:
  - Mobile Money (mocked)
  - Visa / Card (mocked)
- Payment logic kept separate from the UI

## Team

| Name | GitHub | Responsibility |
| --- | --- | --- |
| Micheal Chisha | @chishamichael | _to be agreed_ |
| Munashe Mandizvidza | @munashe-mandi | _to be agreed_ |

## Working rules

1. Plan first. Agree who does what and the cart data shape (e.g. `{ id, name, price, qty }`) in the group chat before coding.
2. Work on your own branch (e.g. `feature/cart`, `feature/checkout`). Don't both work on the same branch.
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

_To be added by the team once the stack is chosen: install and run steps._

## Deadline

Sunday 27 Sept, 6 PM.
