import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpFromLine,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";

export default function MyBalance() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto relative z-10">
      <Card className="glassmorphism rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center surface-elevated p-4">
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">in Credit</h3>
              <p className="text-3xl font-bold text-foreground">$0.00</p>
            </div>
            <div className="text-center surface-elevated p-4 ring-1 ring-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5">
              <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--success))]">My Balance</h3>
              <p className="text-4xl font-bold text-foreground">$0</p>
            </div>
            <div className="text-center surface-elevated p-4">
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">in Cash</h3>
              <p className="text-3xl font-bold text-foreground">$0.00</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button className="w-full justify-start text-foreground hover-lift" variant="outline">
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Withdraw Cash
            </Button>
            <Button className="w-full justify-start text-foreground hover-lift" variant="outline">
              <Ticket className="mr-2 h-4 w-4" />
              Redeem Voucher
            </Button>
            <Button className="w-full justify-start text-foreground hover-lift" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Convert Cash to Credit
            </Button>
            <Button className="w-full justify-start text-foreground hover-lift" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Transfer Credit to Another Member
            </Button>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Record of Transactions
            </h3>
            <p className="text-sm text-muted-foreground">No transactions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
