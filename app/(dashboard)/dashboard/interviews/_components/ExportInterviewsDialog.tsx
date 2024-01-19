import type { Interview } from '@prisma/client';
import { ArrowDownToLine } from 'lucide-react';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Button } from '~/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { useToast } from '~/components/ui/use-toast';
import { exportSessions } from '../_actions/export';
import ExportOptionsView from './ExportOptionsView';

const defaultExportOptions = {
  exportGraphML: true,
  exportCSV: true,
  globalOptions: {
    exportFilename: `networkCanvasExport-${Date.now()}`,
    unifyNetworks: false,
    useScreenLayoutCoordinates: false,
    screenLayoutHeight: 1, // temporarily setting 1 because window isn't provided in the first render
    screenLayoutWidth: 1, // temporarily setting 1 because window isn't provided in the first render
  },
};

export type ExportOptions = typeof defaultExportOptions;

type ExportInterviewsDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  interviewsToExport: Interview[];
  setInterviewsToExport: Dispatch<SetStateAction<Interview[] | undefined>>;
};

export const ExportInterviewsDialog = ({
  open,
  setOpen,
  interviewsToExport,
  setInterviewsToExport,
}: ExportInterviewsDialogProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState(defaultExportOptions);

  useEffect(() => {
    // set window height and width after hydration
    if (typeof window !== 'undefined') {
      setExportOptions((prevState) => ({
        ...prevState,
        globalOptions: {
          ...prevState.globalOptions,
          screenLayoutHeight: window.screen.height,
          screenLayoutWidth: window.screen.width,
        },
      }));
    }
  }, []);

  const handleConfirm = async () => {
    // check if screenLayoutHeight and screenLayoutWidth greater than 1
    if (
      exportOptions.globalOptions.screenLayoutHeight >= 1 &&
      exportOptions.globalOptions.screenLayoutWidth >= 1
    ) {
      // start export process
      setIsExporting(true);
      try {
        const interviewIds = interviewsToExport.map((interview) => ({
          id: interview.id,
        }));

        const result = await exportSessions(interviewIds, exportOptions);
        handleCloseDialog();

        if (result.data) {
          const link = document.createElement('a');
          link.href = result.data.url;
          link.download = result.data.name; // Zip filename
          link.click();
          return;
        }

        throw new Error(result.message);
      } catch (error) {
        handleCloseDialog();
        // eslint-disable-next-line no-console
        console.error('Export failed error:', error);
        toast({
          title: 'Error',
          description: 'Failed to export, please try again!',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setInterviewsToExport([]);
    setExportOptions(defaultExportOptions);
    setOpen(false);
    setIsExporting(false);
  };

  return (
    <>
      {/* Loading state animation */}
      {isExporting && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-3 bg-black text-white opacity-90">
          <div className="animate-bounce rounded-full border-2 border-white bg-green-600 p-4 text-white">
            <ArrowDownToLine className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold">Saving file please wait...</h2>
        </div>
      )}

      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-h-[95%] max-w-[60%]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Confirm File Export Options
            </DialogTitle>
          </DialogHeader>

          <ExportOptionsView
            exportOptions={exportOptions}
            setExportOptions={setExportOptions}
          />

          <DialogFooter>
            <Button
              variant={'outline'}
              size={'sm'}
              onClick={handleCloseDialog}
              className="my-1 text-xs uppercase lg:text-[14px]"
            >
              Cancel
            </Button>
            <Button
              size={'sm'}
              onClick={() => void handleConfirm()}
              className="my-1 text-xs uppercase lg:text-[14px]"
            >
              {isExporting ? 'Exporting...' : 'Start export process'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
