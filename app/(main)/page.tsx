import { Brain, Lightbulb, Workflow } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Bias Cards', href: '#' }, { label: 'Welcome' }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex min-h-[400px] flex-1 items-center justify-center rounded-xl bg-muted/50">
          <div className="container mx-auto flex items-center gap-12 px-6">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="mb-4 font-bold text-4xl">Welcome to Bias Cards</h1>
              <p className="mb-8 text-muted-foreground text-xl">
                An interactive educational tool for exploring machine learning
                biases, mapping them to project lifecycle stages, and applying
                effective mitigation strategies.
              </p>
              <div className="grid gap-4 text-left md:grid-cols-3">
                <div className="p-4">
                  <h3 className="mb-2 font-semibold">Learn</h3>
                  <p className="text-muted-foreground text-sm">
                    Understand cognitive, social, and statistical biases that
                    can impact ML systems
                  </p>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 font-semibold">Map</h3>
                  <p className="text-muted-foreground text-sm">
                    Connect bias considerations to specific stages of your
                    project lifecycle
                  </p>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 font-semibold">Mitigate</h3>
                  <p className="text-muted-foreground text-sm">
                    Apply proven strategies to address biases throughout
                    development
                  </p>
                </div>
              </div>
            </div>
            <div className="relative hidden h-[400px] w-[400px] lg:block">
              <Image
                alt="ML Project Design Process"
                className="object-contain"
                fill
                priority
                src="/project-design.png"
              />
            </div>
          </div>
        </div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Link className="block" href="/cards">
            <Card className="flex aspect-video flex-col items-center justify-center rounded-xl p-6 transition-colors hover:bg-muted/50">
              <Brain className="mb-2 h-12 w-12 text-primary" />
              <h3 className="font-medium text-lg">Explore Bias Cards</h3>
              <p className="mt-1 text-center text-muted-foreground text-sm">
                Browse cognitive, social, and statistical biases
              </p>
            </Card>
          </Link>
          <Link className="block" href="/lifecycle">
            <Card className="flex aspect-video flex-col items-center justify-center rounded-xl p-6 transition-colors hover:bg-muted/50">
              <Workflow className="mb-2 h-12 w-12 text-primary" />
              <h3 className="font-medium text-lg">Project Lifecycle</h3>
              <p className="mt-1 text-center text-muted-foreground text-sm">
                Map biases to ML project stages
              </p>
            </Card>
          </Link>
          <Link className="block" href="/workspace">
            <Card className="flex aspect-video flex-col items-center justify-center rounded-xl p-6 transition-colors hover:bg-muted/50">
              <Lightbulb className="mb-2 h-12 w-12 text-primary" />
              <h3 className="font-medium text-lg">Activity Workspace</h3>
              <p className="mt-1 text-center text-muted-foreground text-sm">
                Create and manage bias analysis activities
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
