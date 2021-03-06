import React, { Fragment, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'

export interface ClearHistoryButtonProps {
  onClearHistory: () => void
}

export const ClearHistoryButton: React.FC<ClearHistoryButtonProps> = ({ onClearHistory }) => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)

  return (
    <Fragment>
      <Button variant={'light'} title={t('landing.history.toolbar.clear')} onClick={handleShow}>
        <ForkAwesomeIcon icon={'trash'}/>
      </Button>
      <Modal show={show} onHide={handleClose} animation={true} className="text-dark">
        <Modal.Header closeButton>
          <Modal.Title>
            <Trans i18nKey={'landing.history.modal.clearHistory.title'}/>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-dark">
          <h5><Trans i18nKey={'landing.history.modal.clearHistory.question'}/></h5>
          <h6><Trans i18nKey={'landing.history.modal.clearHistory.disclaimer'}/></h6>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => {
            onClearHistory()
            handleClose()
          }}>
            <Trans i18nKey={'landing.history.toolbar.clear'}/>
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
