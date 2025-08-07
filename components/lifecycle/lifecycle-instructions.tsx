import { MousePointer2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function LifecycleInstructions() {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <MousePointer2 className="mt-0.5 h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <h3 className="mb-1 font-medium">How to Navigate</h3>
            <p className="text-muted-foreground text-sm">
              Click on any stage in the diagram to view its details and
              description.
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-4 font-semibold text-lg">Three Project Phases</h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 font-medium">Project Design</h4>
            <p className="mb-2 text-muted-foreground text-sm">
              The preliminary tasks and activities that set the foundations for
              the development of the model and system (e.g. impact assessments,
              data extraction and analysis).
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge className="text-xs" variant="outline">
                Project Design
              </Badge>
              <Badge className="text-xs" variant="outline">
                Problem Formulation
              </Badge>
              <Badge className="text-xs" variant="outline">
                Data Extraction and Procurement
              </Badge>
              <Badge className="text-xs" variant="outline">
                Data Analysis
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="mb-1 font-medium">Model Development</h4>
            <p className="mb-2 text-muted-foreground text-sm">
              The technical and computational tasks associated with machine
              learning, such as training, testing, validation, and
              documentation, which are necessary to ensure the model is
              appropriate for its intended use with the target system.
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge className="text-xs" variant="outline">
                Preprocessing and Feature Engineering
              </Badge>
              <Badge className="text-xs" variant="outline">
                Model Selection and Training
              </Badge>
              <Badge className="text-xs" variant="outline">
                Model Testing and Validation
              </Badge>
              <Badge className="text-xs" variant="outline">
                Model Reporting
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="mb-1 font-medium">System Deployment</h4>
            <p className="mb-2 text-muted-foreground text-sm">
              The tasks that ensure the safe and effective deployment and use of
              the system (and underlying model) within the target environment by
              the intended users. This stage includes ongoing monitoring, as
              well as tasks associated with updating or deprovisioning.
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge className="text-xs" variant="outline">
                System Implementation
              </Badge>
              <Badge className="text-xs" variant="outline">
                User Training
              </Badge>
              <Badge className="text-xs" variant="outline">
                System Use and Monitoring
              </Badge>
              <Badge className="text-xs" variant="outline">
                Model Updating and Deprovisioning
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
