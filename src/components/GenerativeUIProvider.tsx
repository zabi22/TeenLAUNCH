import React from 'react';
import { DeadlineCounter, MilestoneProgressBar, EssayWorkflowStep, MetricCard } from './DynamicComponents';

const ComponentMap: Record<string, React.FC<any>> = {
  DeadlineCounter,
  MilestoneProgressBar,
  EssayWorkflowStep,
  MetricCard
};

export interface UIComponentConfig {
  type: string;
  props?: Record<string, any>;
  hidden?: boolean;
}

export interface GenerativeUIConfig {
  layout: string;
  components: UIComponentConfig[];
}

export const GenerativeUIProvider: React.FC<{ config: GenerativeUIConfig | null }> = ({ config }) => {
  if (!config || !config.components) return null;

  return (
    <div className={`generative-ui-layout grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${config.layout}`}>
      {config.components.map((cmp, index) => {
        const Component = ComponentMap[cmp.type];
        if (!Component || cmp.hidden) return null;
        return <Component key={`${cmp.type}-${index}`} {...(cmp.props || {})} />;
      })}
    </div>
  );
};
