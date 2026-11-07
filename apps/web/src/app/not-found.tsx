import Link from "next/link";
import { JewelCoreLogo } from "../components/common/JewelCoreLogo";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <JewelCoreLogo size="lg" variant="badge" showText />
      <h1 className="text-3xl font-bold font-mono text-gold mt-6 mb-2">
        404 - Route Not Found
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        The requested workstation view or ledger node does not exist in the JewelCore Atelier control directory.
      </p>
      <Link href="/">
        <Button variant="gold" size="sm">
          Return to Control Tower
        </Button>
      </Link>
    </div>
  );
}
