import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        animate-pulse rounded-md bg-gray-200
        ${className}
      `}
    />
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="db-stat-card">
      <div className="db-stat-icon">
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="db-stat-body">
        <div className="db-stat-value">
          <Skeleton className="h-6 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="db-stat-label">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
};

export const WorkoutItemSkeleton: React.FC = () => {
  return (
    <div className="db-list-item">
      <div className="db-list-icon workout-icon">
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="db-list-info">
        <div className="db-list-name">
          <Skeleton className="h-4 w-32 mb-2" />
        </div>
        <div className="db-list-meta">
          <Skeleton className="h-3 w-16 mr-2" />
          <Skeleton className="h-3 w-12 mr-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
};

export const NutritionItemSkeleton: React.FC = () => {
  return (
    <div className="db-list-item">
      <div className="db-list-icon nutrition-icon">
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="db-list-info">
        <div className="db-list-name">
          <Skeleton className="h-4 w-32 mb-2" />
        </div>
        <div className="db-list-meta">
          <Skeleton className="h-3 w-16 mr-2" />
          <Skeleton className="h-3 w-12 mr-2" />
          <Skeleton className="h-3 w-8 mr-2" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <>
      {/* Stat Cards Skeleton */}
      <div className="db-stat-grid">
        {[...Array(4)].map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="db-content-grid">
        {/* Recent Workouts Skeleton */}
        <div className="db-card">
          <div className="db-card-header">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="db-list">
            {[...Array(3)].map((_, index) => (
              <WorkoutItemSkeleton key={index} />
            ))}
          </div>
        </div>

        {/* Recent Nutrition Skeleton */}
        <div className="db-card">
          <div className="db-card-header">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="db-list">
            {[...Array(3)].map((_, index) => (
              <NutritionItemSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Skeleton;
