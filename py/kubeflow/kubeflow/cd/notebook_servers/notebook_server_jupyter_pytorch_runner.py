# This file is only intended for development purposes
from kubeflow.kubeflow.cd import base_runner

base_runner.main(component_name="notebook-server-jupyter-pytorch",
                 workflow_name="nb-j-pt-build")
