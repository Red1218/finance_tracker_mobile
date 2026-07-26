import { 
  ISyncQueueRepository, 
  ISyncTransportProvider, 
  INetworkStatusProvider,
  EnqueueSyncOperationUseCase,
  ProcessSyncQueueUseCase,
  ResolveSyncConflictUseCase
} from '../application';
import { 
  InMemorySyncQueueRepository, 
  SupabaseSyncTransportProvider, 
  NetworkStatusProviderImpl 
} from '../../../platform/persistence/sync';
import { SyncController } from '../presentation/controllers/SyncController';

export class SyncModule {
  public readonly queueRepository: ISyncQueueRepository;
  public readonly transportProvider: ISyncTransportProvider;
  public readonly networkStatusProvider: INetworkStatusProvider;
  public readonly enqueueSyncOperationUseCase: EnqueueSyncOperationUseCase;
  public readonly processSyncQueueUseCase: ProcessSyncQueueUseCase;
  public readonly resolveSyncConflictUseCase: ResolveSyncConflictUseCase;
  public readonly syncController: SyncController;

  constructor(
    queueRepo?: ISyncQueueRepository,
    transport?: ISyncTransportProvider,
    network?: INetworkStatusProvider
  ) {
    this.queueRepository = queueRepo ?? new InMemorySyncQueueRepository();
    this.transportProvider = transport ?? new SupabaseSyncTransportProvider();
    this.networkStatusProvider = network ?? new NetworkStatusProviderImpl();

    this.enqueueSyncOperationUseCase = new EnqueueSyncOperationUseCase(this.queueRepository);
    this.processSyncQueueUseCase = new ProcessSyncQueueUseCase(
      this.queueRepository,
      this.transportProvider
    );
    this.resolveSyncConflictUseCase = new ResolveSyncConflictUseCase(this.queueRepository);

    this.syncController = new SyncController(
      this.processSyncQueueUseCase,
      this.resolveSyncConflictUseCase,
      this.queueRepository,
      this.networkStatusProvider
    );

    Object.freeze(this);
  }
}

export const syncModule = new SyncModule();
