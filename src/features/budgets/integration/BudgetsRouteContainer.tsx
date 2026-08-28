import React, { useMemo } from 'react';
import { BudgetsScreen } from '../presentation/screens/BudgetsScreen';
import { BudgetsModule } from '../composition/BudgetsModule';

export interface BudgetsRouteContainerProps {
  module?: BudgetsModule;
}

export const BudgetsRouteContainer: React.FC<BudgetsRouteContainerProps> = ({ module }) => {
  const budgetsModule = module || useMemo(() => new BudgetsModule(), []);

  return <BudgetsScreen module={budgetsModule} />;
};

