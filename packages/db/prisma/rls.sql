-- Row Level Security policies for TipItaly Card
-- Apply these via the Supabase SQL editor AFTER running `pnpm db:push`
-- Prisma does not manage RLS — these must be applied manually.

-- ─── Enable RLS on sensitive tables ─────────────────────────────────────────

ALTER TABLE "Cardholder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CardAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CouponRedemption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TravelBooking" ENABLE ROW LEVEL SECURITY;

-- Public/admin tables (read-only for authenticated users, write via service role)
ALTER TABLE "Card" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Partner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TravelOffer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CardBatch" ENABLE ROW LEVEL SECURITY;

-- ─── Cardholder: own row only ────────────────────────────────────────────────

CREATE POLICY "cardholder_select_own" ON "Cardholder"
  FOR SELECT USING (auth.uid()::text = "supabaseUid");

CREATE POLICY "cardholder_insert_own" ON "Cardholder"
  FOR INSERT WITH CHECK (auth.uid()::text = "supabaseUid");

CREATE POLICY "cardholder_update_own" ON "Cardholder"
  FOR UPDATE USING (auth.uid()::text = "supabaseUid");

-- ─── CardAssignment: cardholder sees their own assignments ───────────────────

CREATE POLICY "cardassignment_select_own" ON "CardAssignment"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Cardholder" ch
      WHERE ch.id = "CardAssignment"."cardholderId"
        AND ch."supabaseUid" = auth.uid()::text
    )
  );

-- ─── CouponRedemption: cardholder sees their own redemptions ─────────────────

CREATE POLICY "couponredemption_select_own" ON "CouponRedemption"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Cardholder" ch
      WHERE ch.id = "CouponRedemption"."cardholderId"
        AND ch."supabaseUid" = auth.uid()::text
    )
  );

CREATE POLICY "couponredemption_insert_own" ON "CouponRedemption"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Cardholder" ch
      WHERE ch.id = "CouponRedemption"."cardholderId"
        AND ch."supabaseUid" = auth.uid()::text
    )
  );

-- ─── TravelBooking: cardholder sees their own bookings ───────────────────────

CREATE POLICY "travelbooking_select_own" ON "TravelBooking"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Cardholder" ch
      WHERE ch.id = "TravelBooking"."cardholderId"
        AND ch."supabaseUid" = auth.uid()::text
    )
  );

CREATE POLICY "travelbooking_insert_own" ON "TravelBooking"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Cardholder" ch
      WHERE ch.id = "TravelBooking"."cardholderId"
        AND ch."supabaseUid" = auth.uid()::text
    )
  );

-- ─── Public catalogue: any authenticated user can read ───────────────────────

CREATE POLICY "partner_select_authenticated" ON "Partner"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "coupon_select_authenticated" ON "Coupon"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "traveloffer_select_authenticated" ON "TravelOffer"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cards, batches, companies: service role only (admin / server-side writes)
-- No authenticated user policies — all mutations via service role key.
