import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
//   ArrowDownToLine,
  ArrowUpFromLine,
//   CreditCard,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";

export default function MyBalance() {
  return (
    <div className="container mx-auto p-4">
      <Card className="bg-slate-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">in Credit</h3>
              <p className="text-3xl font-bold">$0.00</p>
            </div>
            <div className="text-center bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">My Balance</h3>
              <p className="text-4xl font-bold">$0</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">in Cash</h3>
              <p className="text-3xl font-bold">$0.00</p>
            </div>
          </div>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Withdraw Cash
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Ticket className="mr-2 h-4 w-4" />
              Redeem Voucher
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Convert Cash to Credit
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Transfer Credit to Another Member
            </Button>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">
              Record of Transactions
            </h3>
            <p className="text-gray-500">No transactions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
