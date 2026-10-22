import { useStorage } from '../../app/storageContext';
import './StorageWarning.css';

export function StorageWarning() {
  const { saveFailed } = useStorage();
  if (!saveFailed) {
    return null;
  }

  return (
    <div className="storage-warning">
      <p className="storage-warning__message" role="alert">
        Your progress can't be saved on this device right now. Practice can keep going, but results
        may not be remembered after the browser is closed. This can happen in private browsing or
        when the browser's storage is full.
      </p>
    </div>
  );
}
