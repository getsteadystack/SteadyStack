-- Add new protocol monitor types: gRPC health, mail (SMTP/IMAP/POP3), file transfer, and ICMP ping
ALTER TYPE "MonitorType" ADD VALUE 'GRPC';
ALTER TYPE "MonitorType" ADD VALUE 'SMTP';
ALTER TYPE "MonitorType" ADD VALUE 'FTP';
ALTER TYPE "MonitorType" ADD VALUE 'ICMP';
ALTER TYPE "MonitorType" ADD VALUE 'MAIL';
