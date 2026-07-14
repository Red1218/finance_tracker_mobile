import React, { ReactNode } from 'react';

export type NavigationContainerProps = Readonly<{
  children?: ReactNode;
}>;

export function NavigationContainer({ children }: NavigationContainerProps) {
  return <>{children}</>;
}
