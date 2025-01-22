import React from 'react';

import { Connection } from '@/types/types';

import {
  AppTabContent,
  AppTabHeader,
} from '@/components/layout/app-tab';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useProjectStore } from '@/stores/project';
import { arr } from '@/utils/generic';

export default function TabConnections() {
  const { project } = useProjectStore();

  const connections = arr.sortBy(
    project?.crm?.connections,
    'isConnected',
  );

  return (
    <>
      <AppTabHeader label="Connections" />
      <AppTabContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {connections.map((connection: Connection) => (
            <div
              key={connection.id}
              className="flex items-center space-x-4 rounded-md border p-4"
            >
              <Avatar>
                {!connection.connector.logo ? (
                  <AvatarImage src="not-found" alt="" />
                ) : (
                  <AvatarImage
                    className="object-scale-down"
                    alt="app"
                    src={
                      connection.connector.logo.includes(
                        'zoho_new_logo.png',
                      )
                        ? `https://crm.zoho.com${connection.connector.logo}`
                        : connection.connector.logo
                    }
                  />
                )}
                <AvatarFallback>?</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {connection.displayName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {connection.name}
                </p>
              </div>
              <Switch checked={connection.isConnected} />
            </div>
          ))}
        </div>
      </AppTabContent>
    </>
  );
}
