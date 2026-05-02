FROM python:3.11-slim
WORKDIR /app
COPY ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ai-service/ .
RUN python -m model.trainer
ENV PORT=5001
EXPOSE 5001
CMD ["python", "app.py"]
