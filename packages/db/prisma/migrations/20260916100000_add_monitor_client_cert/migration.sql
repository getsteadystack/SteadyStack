-- Add client certificate column for mTLS HTTP monitors (encrypted PEM bundle)
ALTER TABLE "Monitor" ADD COLUMN "clientCert" TEXT;
