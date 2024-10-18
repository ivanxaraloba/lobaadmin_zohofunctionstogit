import React from 'react';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

import { Button, ButtonProps } from './button';

interface ButtonLoadingProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ElementType;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({ loading = false, icon: Icon, children, ...props }) => {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      <div className={cn('flex items-center gap-2')}>
        {children}
        {loading ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" />}
      </div>
    </Button>
  );
};

export default ButtonLoading;
