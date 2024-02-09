'use client';

import type { Participant, Protocol } from '@prisma/client';
import { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import { Button } from '~/components/ui/Button';
import { api } from '~/trpc/client';
import { getBaseUrl } from '~/trpc/shared';
import { useToast } from '~/components/ui/use-toast';
import { Popover, PopoverContent } from '~/components/ui/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import Paragraph from '~/components/ui/typography/Paragraph';

export const GenerateParticipationURLButton = ({
  participant,
}: {
  participant: Participant;
}) => {
  const { data: protocolData, isLoading: isLoadingProtocols } =
    api.protocol.get.all.useQuery();
  const [protocols, setProtocols] = useState<Protocol[]>([]);

  const [selectedProtocol, setSelectedProtocol] = useState<Protocol>();

  useEffect(() => {
    if (protocolData) {
      setProtocols(protocolData);
    }
  }, [protocolData]);

  const { toast } = useToast();

  const handleCopy = (url: string) => {
    if (url) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast({
            description: 'Copied to clipboard',
            variant: 'success',
            duration: 3000,
          });
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Could not copy text',
            variant: 'destructive',
          });
        });
    }
  };

  const ref = useRef<HTMLButtonElement>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="xs" ref={ref}>
          Generate Participation URL
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        <Paragraph variant="smallText">
          Generate a unique participation URL for this participant. Select a
          protocol, and the URL will be copied to your clipboard.
        </Paragraph>
        <Select
          onValueChange={(value) => {
            const protocol = protocols.find(
              (protocol) => protocol.id === value,
            );

            setSelectedProtocol(protocol);
            handleCopy(
              `${getBaseUrl()}/onboard/${protocol?.id}/?participantId=${
                participant.id
              }`,
            );

            ref.current?.click();
          }}
          value={selectedProtocol?.id}
          disabled={isLoadingProtocols}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Protocol..." />
          </SelectTrigger>
          <SelectContent>
            {protocols?.map((protocol) => (
              <SelectItem key={protocol.id} value={protocol.id}>
                {protocol.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
};
