'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with deployed contract address
const CONTRACT_ADDRESS = '0x...' as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);

  // Read contract state
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [], // TODO: Add ABI
    functionName: 'totalSupply',
  });

  const { data: maxMintable } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'maxMintable',
  });

  const { data: remainingForWallet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'remainingMintable',
    args: address ? [address] : undefined,
  });

  const { data: mintCost } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [],
    functionName: 'getMintCost',
    args: [BigInt(quantity)],
  });

  // Write contract
  const { writeContract, isPending } = useWriteContract();

  const handleMint = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: [],
      functionName: 'mint',
      args: [BigInt(quantity)],
      value: mintCost || BigInt(0),
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Crypto Quarters</h1>
          <ConnectButton />
        </header>

        {/* Hero */}
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Collect All 50 States</h2>
          <p className="text-xl text-muted-foreground mb-8">
            500,000 unique quarters. 50 states. 10,000 serials each.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-8">
            <Card className="w-40">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{String(totalSupply ?? '0')}</div>
                <div className="text-sm text-muted-foreground">Minted</div>
              </CardContent>
            </Card>
            <Card className="w-40">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{String(maxMintable ?? '0')}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card className="w-40">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">500,000</div>
                <div className="text-sm text-muted-foreground">Total Supply</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mint Section */}
        {isConnected ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Mint Quarters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(Math.min(Number(remainingForWallet || 50), quantity + 1))}
                  >
                    +
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  You can mint up to {String(remainingForWallet ?? '50')} more
                </p>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost:</span>
                <Badge variant="secondary">
                  {mintCost ? `${Number(mintCost) / 1e18} ETH` : 'FREE'}
                </Badge>
              </div>

              <Button
                onClick={handleMint}
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? 'Minting...' : `Mint ${quantity} Quarter${quantity > 1 ? 's' : ''}`}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <section className="text-center">
            <p className="text-muted-foreground mb-4">Connect your wallet to mint</p>
          </section>
        )}

        {/* Map Section - TODO */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold mb-4 text-center">Your Collection</h3>
          <p className="text-center text-muted-foreground">Map view coming soon...</p>
        </section>
      </div>
    </main>
  );
}
