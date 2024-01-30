export interface ScopedError<ErrorKey extends string = string> {
  error: ErrorKey;
  message: string;
  selector: string;
}
