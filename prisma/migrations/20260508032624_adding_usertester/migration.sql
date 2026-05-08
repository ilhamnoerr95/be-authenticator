-- CreateTable
CREATE TABLE "UserTester" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "UserTester_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTester_email_key" ON "UserTester"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserTester_username_key" ON "UserTester"("username");
