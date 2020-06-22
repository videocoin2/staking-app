import React from 'react';
import { Modal as BaseModal, ModalProps, Overlay } from 'ui-kit';
import usePortal from 'react-useportal';
import useLockBodyScroll from 'hooks/useLockBodyScroll';
import './modal.scss';

const Modal = ({ ...props }: ModalProps & { onClose: () => void }) => {
  useLockBodyScroll();
  const { Portal } = usePortal({
    bindTo: document && (document.getElementById('modal-root') as any),
  });

  return (
    <Portal>
      <Overlay onClick={props.onClose}>
        <BaseModal {...props} />
      </Overlay>
    </Portal>
  );
};

export default Modal;
