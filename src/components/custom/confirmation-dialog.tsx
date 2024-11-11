import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  buttonText: string
  buttonClass: string
  onConfirm: () => Promise<void>
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  buttonText,
  buttonClass,
  onConfirm
}: ConfirmationDialogProps) {
  const dashboardDatatableTranslation = useTranslations('dashboard.dataTable.ConfirmationDialog')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='rtl:text-right'>
        <AlertDialogHeader>
          <AlertDialogTitle className='rtl:text-right'>{title}</AlertDialogTitle>
          <AlertDialogDescription className='rtl:text-right'>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex gap-x-3 rtl:flex-row-reverse'>
          <AlertDialogCancel>{dashboardDatatableTranslation('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={buttonClass}>
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
